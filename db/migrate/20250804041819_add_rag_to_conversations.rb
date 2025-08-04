class AddRagToConversations < ActiveRecord::Migration[8.0]
  def change
    add_column :conversations, :rag, :boolean, default: false, null: false
  end
end
