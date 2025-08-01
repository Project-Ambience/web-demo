class CreateInterRaterFeedbacks < ActiveRecord::Migration[8.0]
  def change
    create_table :inter_rater_feedbacks do |t|
      t.references :inter_rater, null: false, foreign_key: true
      t.integer :rating, null: false
      t.string :comment, null: false

      t.timestamps
    end
  end
end
