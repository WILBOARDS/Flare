import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('creator_tokens')
export class CreatorTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'creator_id', type: 'uuid', unique: true })
  creatorId: string;

  @Column({ name: 'contract_address', type: 'varchar', length: 42 })
  contractAddress: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  symbol: string;

  @Column({ name: 'tx_hash', type: 'varchar', length: 66 })
  txHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: UserEntity;
}
