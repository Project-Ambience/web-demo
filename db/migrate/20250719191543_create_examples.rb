class CreateExamples < ActiveRecord::Migration[8.0]
  def change
    create_table :examples do |t|
      t.text :input, null: false
      t.text :output, null: false
      t.references :few_shot_template, null: false, foreign_key: true

      t.timestamps
    end
  end
end
