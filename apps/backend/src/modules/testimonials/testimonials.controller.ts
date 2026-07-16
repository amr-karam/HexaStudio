import { Controller, Get, Param, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { Testimonial, TestimonialResponse } from '@hexastudio/types';

@Controller({ path: 'testimonials', version: VERSION_NEUTRAL })
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
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
  async findFeatured(): Promise<Testimonial[]> {
    return this.testimonialsService.getFeaturedTestimonials();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Testimonial> {
    return this.testimonialsService.getTestimonialById(id);
  }
}
