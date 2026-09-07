import {sql} from 'drizzle-orm';
import {sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const subscribers=sqliteTable('subscribers',{
 email:text('email').primaryKey(),
 consentVersion:text('consent_version').notNull(),
 subscribedAt:text('subscribed_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

import {integer,primaryKey} from 'drizzle-orm/sqlite-core';
export const bagItems=sqliteTable('bag_items',{
 bagId:text('bag_id').notNull(),productId:text('product_id').notNull(),size:text('size').notNull(),quantity:integer('quantity').notNull()
},table=>[primaryKey({columns:[table.bagId,table.productId,table.size]})]);

export const productEdits=sqliteTable('product_edits',{
 id:text('id').primaryKey(),name:text('name').notNull(),description:text('description').notNull(),priceCents:integer('price_cents').notNull(),stockStatus:text('stock_status').notNull()
});

export const storeInfo=sqliteTable('store_info',{key:text('key').primaryKey(),value:text('value').notNull()});
export const contactMessages=sqliteTable('contact_messages',{id:text('id').primaryKey(),name:text('name').notNull(),email:text('email').notNull(),message:text('message').notNull(),createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)});

export const sizeInventory=sqliteTable('size_inventory',{productId:text('product_id').notNull(),size:text('size').notNull(),quantity:integer('quantity').notNull()},t=>[primaryKey({columns:[t.productId,t.size]})]);
export const welcomeEmails=sqliteTable('welcome_emails',{email:text('email').primaryKey(),code:text('code').notNull().unique(),status:text('status').notNull().default('awaiting_connection'),createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)});
export const bagDiscounts=sqliteTable('bag_discounts',{bagId:text('bag_id').primaryKey(),code:text('code').notNull()});
