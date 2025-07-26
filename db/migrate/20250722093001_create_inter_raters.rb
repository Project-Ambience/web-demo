class CreateInterRaters < ActiveRecord::Migration[8.0]
  def change
    create_table :inter_raters do |t|
      t.references :first_conversation, null: false, foreign_key: { to_table: :conversations }
      t.references :second_conversation, null: false, foreign_key: { to_table: :conversations }
      t.string :comment
      t.integer :rating
      t.references :ai_model, null: false, foreign_key: true

      t.timestamps
    end
  end
end
