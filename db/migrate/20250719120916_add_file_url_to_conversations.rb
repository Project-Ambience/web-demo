class AddFileUrlToConversations < ActiveRecord::Migration[8.0]
  def change
    add_column :conversations, :file_url, :string
  end
end
