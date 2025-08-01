class RemoveRatingAndCommentFromInterRaters < ActiveRecord::Migration[8.0]
  def change
    remove_column :inter_raters, :rating, :integer
    remove_column :inter_raters, :comment, :string
  end
end
