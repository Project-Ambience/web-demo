class CreateSuggestedPrompts < ActiveRecord::Migration[8.0]
  def change
    create_table :suggested_prompts do |t|
      t.string :prompt
      t.references :ai_model, null: false, foreign_key: true

      t.timestamps
    end
  end
end
