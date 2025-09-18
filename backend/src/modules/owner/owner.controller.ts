import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { CreateOwnerDto } from './dto/create-owner.dto';

@Controller('owner')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Roles('OWNER')
  async registerOwner(@Body() createOwnerDto: CreateOwnerDto) {
    return this.ownerService.createOwner(createOwnerDto);
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @Roles('OWNER')
  async getAllOwners() {
    return this.ownerService.getAllOwners();
  }
}
