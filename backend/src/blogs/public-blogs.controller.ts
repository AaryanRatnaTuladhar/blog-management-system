import { Controller, Get, Param } from '@nestjs/common';
import { BlogsService } from './blogs.service.js';

@Controller('public/blogs')
export class PublicBlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  list() {
    return this.blogsService.listPublic();
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.blogsService.getPublic(id);
  }
}
