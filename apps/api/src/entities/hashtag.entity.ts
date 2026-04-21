import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('hashtags')
export class HashtagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  tag: string;
}
