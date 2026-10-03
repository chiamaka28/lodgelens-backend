#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/d16cc5a026e2ca03dc8926749f90194dd1b957f3fefbaab6ed999c3109b51efb/contract';
import endContract from '../../snapshots/d16cc5a026e2ca03dc8926749f90194dd1b957f3fefbaab6ed999c3109b51efb/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'Roles',
        members: ['STUDENT', 'LODGE_OWNER', 'ADMIN'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'RoomType',
        members: ['SELF_CONTAIN', 'SINGLE_ROOM', 'FLAT'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'Status',
        members: ['PENDING', 'APPROVED', 'SUSPENDED'],
      }),
      this.createTable({
        schema: 'public',
        table: 'lodge',
        columns: [
          col('amenities', 'text[]', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1', many: true },
          }),
          col('annual_rent', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('available_rooms', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('distance', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('images', 'text[]', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1', many: true },
          }),
          col('landlord', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('roomType', '"RoomType"', {
            notNull: true,
            default: lit('SELF_CONTAIN'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'RoomType' } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'lodge_amenities_elem_not_null_8aca8596',
            'array_position("amenities", NULL) IS NULL',
          ),
          checkExpression(
            'lodge_images_elem_not_null_2f12556f',
            'array_position("images", NULL) IS NULL',
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'refreshToken',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('expiresAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('token', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'user',
        columns: [
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('firstname', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('lastname', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', '"Roles"', {
            notNull: true,
            default: lit('STUDENT'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'Roles' } },
          }),
          col('status', '"Status"', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'Status' } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'refreshToken',
        constraint: 'refreshToken_token_key',
        columns: ['token'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'refreshToken',
        index: 'refreshToken_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'refreshToken',
        foreignKey: {
          name: 'refreshToken_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
