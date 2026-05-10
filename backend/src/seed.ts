import 'reflect-metadata';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { Blog } from './blogs/blog.entity';
import { Comment } from './comments/comment.entity';
import { Notification } from './notifications/notification.entity';
import { User, UserRole } from './users/user.entity';

const password = 'password123';

const seedUsers = [
  {
    email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
    role: 'admin' as UserRole,
  },
  { email: 'maya@example.com', role: 'user' as UserRole },
  { email: 'ram@example.com', role: 'user' as UserRole },
  { email: 'sita@example.com', role: 'user' as UserRole },
];

const seedBlogs = [
  {
    title: 'Getting Started With Editorial Workflows',
    content:
      'A practical introduction to drafting, submitting, reviewing, and publishing blog content inside a small CMS. This article explains how teams can keep writing fast while still giving admins a clear approval gate.',
  },
  {
    title: 'How Async Notifications Improve Content Teams',
    content:
      'Notifications keep authors informed when posts are approved, rejected, commented on, or replied to. Processing these events asynchronously helps the application stay responsive during busy editorial activity.',
  },
  {
    title: 'Caching Public Blog Lists With Redis',
    content:
      'Public blog listings are read frequently and changed less often. Redis caching makes that path quicker while cache invalidation keeps readers seeing fresh approved content after publication.',
  },
  {
    title: 'Why Role Based Access Matters',
    content:
      'A CMS needs clear boundaries between normal users and administrators. Role based access control ensures authors manage their own drafts while admins handle approvals, moderation, and user management.',
  },
  {
    title: 'Designing Nested Comment Threads',
    content:
      'Nested comments give conversations structure. Replies should stay attached to their parent comments, and soft deletion keeps the thread readable even when content is removed.',
  },
  {
    title: 'Avoiding Duplicate Blog Submissions',
    content:
      'Duplicate submissions are confusing for reviewers and authors. A status based workflow helps prevent the same draft from entering the approval queue multiple times.',
  },
  {
    title: 'Moderation Basics For Blog Platforms',
    content:
      'Moderation tools should let admins remove harmful or irrelevant comments without deleting the entire discussion. A focused moderation surface makes this work quicker and easier.',
  },
];

const commentTexts = [
  'This makes the approval flow very clear.',
  'I like how the admin review step keeps public content curated.',
  'The caching explanation is helpful for performance work.',
  'Nested replies make the discussion easier to follow.',
  'This would be useful for onboarding new writers.',
  'The moderation approach feels practical for a small team.',
];

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'blog_management',
  entities: [User, Blog, Comment, Notification],
  synchronize: true,
});

async function ensureUser(
  repo: Repository<User>,
  email: string,
  role: UserRole,
) {
  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await repo.findOne({ where: { email } });
  if (existing) {
    existing.role = role;
    existing.isActive = true;
    existing.passwordHash = passwordHash;
    await repo.save(existing);
    return existing;
  }
  return repo.save(repo.create({ email, role, passwordHash, isActive: true }));
}

async function main() {
  await AppDataSource.initialize();

  const usersRepo = AppDataSource.getRepository(User);
  const blogsRepo = AppDataSource.getRepository(Blog);
  const commentsRepo = AppDataSource.getRepository(Comment);

  const users = await Promise.all(
    seedUsers.map((user) => ensureUser(usersRepo, user.email, user.role)),
  );
  const authors = users.filter((user) => user.role === 'user');

  const blogs: Blog[] = [];
  for (let index = 0; index < seedBlogs.length; index += 1) {
    const input = seedBlogs[index];
    const existing = await blogsRepo.findOne({ where: { title: input.title } });
    if (existing) {
      blogs.push(existing);
      continue;
    }

    const blog = blogsRepo.create({
      ...input,
      author: authors[index % authors.length],
      status: 'approved',
      publishedAt: new Date(Date.now() - index * 86400000),
      version: 1,
    });
    blogs.push(await blogsRepo.save(blog));
  }

  const existingSeedComments = await commentsRepo
    .createQueryBuilder('comment')
    .where('comment.content IN (:...texts)', { texts: commentTexts })
    .getCount();

  if (existingSeedComments === 0) {
    for (let index = 0; index < commentTexts.length; index += 1) {
      const blog = blogs[index % blogs.length];
      const author = authors[(index + 1) % authors.length];
      const comment = await commentsRepo.save(
        commentsRepo.create({
          blog,
          author,
          content: commentTexts[index],
        }),
      );

      if (index % 2 === 0) {
        await commentsRepo.save(
          commentsRepo.create({
            blog,
            author: authors[(index + 2) % authors.length],
            parentComment: comment,
            content: `Replying to: ${commentTexts[index]}`,
          }),
        );
      }
    }
  }

  console.log('Seed complete.');
  console.log(`Admin: ${seedUsers[0].email} / ${password}`);
  console.log(
    'General users: maya@example.com, ram@example.com, sita@example.com',
  );
  console.log(`Blogs available: ${blogs.length}`);

  await AppDataSource.destroy();
}

void main().catch(async (error: unknown) => {
  console.error(error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
