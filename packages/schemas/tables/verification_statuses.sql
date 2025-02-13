create table verification_statuses (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  user_id varchar(21) not null
    references users (id) on update cascade on delete cascade,
  session_id varchar(128) not null,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index verification_statuses__id
  on verification_statuses (tenant_id, id);

create index verification_statuses__user_id__session_id
  on verification_statuses (tenant_id, user_id, session_id);
