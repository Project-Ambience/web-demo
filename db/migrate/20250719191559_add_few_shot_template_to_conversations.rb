class AddFewShotTemplateToConversations < ActiveRecord::Migration[8.0]
  def change
    add_column :conversations, :few_shot_template, :jsonb
  end
end
