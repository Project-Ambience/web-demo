class AddCotToConversations < ActiveRecord::Migration[8.0]
  def change
    add_column :conversations, :cot, :boolean, default: false, null: false
  end
end
