class Api::CommentsController < Api::ApplicationController
  def create
    ai_model = AiModel.find(params[:ai_model_id])
    comment = ai_model.comments.build(comment_params)

    if comment.save
      render json: comment, status: :created
    else
      render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def comment_params
    params.require(:comment).permit(:comment)
  end
end