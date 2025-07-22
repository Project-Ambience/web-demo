class AddRatingAndCommentToInterRater < ActiveRecord::Migration[8.0]
  def change
    add_column :inter_raters, :comment, :string
    add_column :inter_raters, :rating, :integer
  end
end
