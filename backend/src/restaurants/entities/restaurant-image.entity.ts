import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('restaurant_images')
export class RestaurantImage {
  @PrimaryColumn()
  kakaoPlaceId: string;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;
}
