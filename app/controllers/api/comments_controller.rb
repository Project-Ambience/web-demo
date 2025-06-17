class Api::CommentsController < Api::ApplicationController
    before_action :set_ai_model

    def create
      @comment = @ai_model.comments.new(comment_params)
  
      if @comment.save
        render json: @comment, status: :created
      else
        render json: @comment.errors, status: :unprocessable_entity
      end
    end
  
    private
  
    def set_ai_model
      @ai_model = AiModel.find(params[:ai_model_id])
    end
  
    def comment_params
      params.require(:comment).permit(:comment)
    end
end