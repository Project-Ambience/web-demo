class CommentsController < ApplicationController
  def create
    @ai_model = AiModel.find(params[:ai_model_id])
    @comment = @ai_model.comments.build(comment_params)

    @comment.save
    redirect_to ai_model_path(@ai_model)
  end

  private

  def comment_params
    params.require(:comment).permit(:comment)
  end
end
