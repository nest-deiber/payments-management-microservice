/**
 * @file Data Transfer Object for the payment session request payload.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsPositive, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * @class PaymentSessionItemDto
 * @description DTO for an item within the payment session request.
 */
export class PaymentSessionItemDto {
  /**
   * @property {string} name - Name of the product/item.
   * @decorator IsString
   */
  @IsString()
  @ApiProperty({
    description: 'Name of the product or item',
    example: 'Premium T-shirt',
  })
  name: string;

  /**
   * @property {number} price - Price per unit.
   * @decorator IsNumber
   * @decorator IsPositive
   * @decorator Type
   */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({
    description: 'Price per unit in the specified currency',
    example: 25.99,
  })
  price: number;

  /**
   * @property {number} quantity - Quantity of the item.
   * @decorator IsNumber
   * @decorator IsPositive
   * @decorator Type
   */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({
    description: 'Quantity of the item to purchase',
    example: 2,
  })
  quantity: number;
}

/**
 * @class PaymentSessionDto
 * @description DTO for the overall payment session creation request.
 */
export class PaymentSessionDto {
  /**
   * @property {string} orderId - The ID (UUID/CUID) of the associated order.
   * @decorator IsString
   * @decorator IsUUID
   */
  @IsString()
  @IsUUID(4) // Assuming order ID is UUID v4 from previous schema
  @ApiProperty({
    description: 'ID of the order associated with the payment (UUID v4)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  orderId: string;

  /**
   * @property {string} currency - Currency code (e.g., 'usd', 'cop').
   * @decorator IsString
   */
  @IsString()
  @ApiProperty({
    description: 'ISO 4217 currency code (e.g., usd, eur, gbp)',
    example: 'usd',
  })
  currency: string;

  /**
   * @property {PaymentSessionItemDto[]} items - Array of items for the session.
   * @decorator IsArray
   * @decorator ArrayMinSize
   * @decorator ValidateNested
   * @decorator Type
   */
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PaymentSessionItemDto)
  @ApiProperty({
    description: 'List of items to include in the payment session',
    type: [PaymentSessionItemDto],
  })
  items: PaymentSessionItemDto[];
}