class AddStatusToConversations < ActiveRecord::Migration[8.0]
  def change
    add_column :conversations, :status, :integer, default: 0, null: false
  end
end
