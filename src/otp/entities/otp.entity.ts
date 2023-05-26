import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OTPType } from '../enums/otp.enum';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'otp' })
export class OTP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Column({ type: 'enum', enum: OTPType, default: OTPType.OTHER })
  otp_type: OTPType;

  @Column('uuid')
  user_id: string;
  @ManyToOne(() => User, (user) => user.otps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
