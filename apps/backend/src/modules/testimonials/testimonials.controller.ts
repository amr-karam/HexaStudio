import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';
import type { Testimonial, TestimonialResponse } from '@hexastudio/types';

@ApiTags('Testimonials')
@Controller({ path: 'testimonials', version: '1' })
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all testimonials with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<TestimonialResponse> {
    return this.testimonialsService.getAllTestimonials(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured testimonials' })
  async findFeatured(): Promise<Testimonial[]> {
    return this.testimonialsService.getFeaturedTestimonials();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get testimonial by ID' })
  async findOne(@Param('id') id: string): Promise<Testimonial> {
    return this.testimonialsService.getTestimonialById(id);
  }
}
