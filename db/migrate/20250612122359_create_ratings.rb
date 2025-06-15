class CreateRatings < ActiveRecord::Migration[8.0]
  def change
    create_table :ratings do |t|
      t.integer :rating
      t.references :ai_model, null: false, foreign_key: true

      t.timestamps
    end
  end
end
