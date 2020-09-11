class RenamePermittableFromPermissions < ActiveRecord::Migration[6.0]
  def change
    rename_column :permissions, :permittable_id, :permission_scope_id
    rename_column :permissions, :permittable_type, :permission_scope_type
  end
end
