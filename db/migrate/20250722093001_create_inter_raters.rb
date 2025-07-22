class CreateInterRaters < ActiveRecord::Migration[8.0]
  def change
    create_table :inter_raters do |t|
      t.string :prompt
      t.string :first_response
      t.text :second_response
      t.string :file_url
      t.references :ai_model, null: false, foreign_key: true
      t.integer :evaluation_category

      t.timestamps
    end
  end
end
