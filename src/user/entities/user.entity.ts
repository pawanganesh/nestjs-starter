import * as argon from 'argon2';
import { OTP } from '../../otp/entities/otp.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  full_name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'text', select: false })
  password: string;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;

  // listeners
  @BeforeInsert()
  @BeforeUpdate()
  hashPasswordBeforeSave = async () => {
    if (this.password) this.password = await argon.hash(this.password);
  };

  comparePassword = async (attempt: string) => {
    return await argon.verify(this.password, attempt);
  };

  // relations
  @OneToMany(() => OTP, (otp) => otp.user)
  otps: OTP[];
}
