class Api::ConversationsController < Api::ApplicationController
  before_action :set_conversation, only: [ :show, :update, :destroy ]

  def index
    @conversations = Conversation.includes(:ai_model).order(updated_at: :desc)

    response_data = @conversations.map do |convo|
      {
        id: convo.id,
        title: convo.title,
        updated_at: convo.updated_at,
        ai_model: {
          name: convo.ai_model.name
        }
      }
    end
    render json: response_data
  end

  def show
    render json: @conversation.as_json(include: :messages)
  end

  def create
    @conversation = Conversation.new(conversation_params)
    if @conversation.save
      render json: @conversation, status: :created
    else
      render json: @conversation.errors, status: :unprocessable_entity
    end
  end

  def update
    if @conversation.update(conversation_params)
      render json: @conversation
    else
      render json: @conversation.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @conversation.destroy
    head :no_content
  end

  private

  def set_conversation
    @conversation = Conversation.find(params[:id])
  end

  def conversation_params
    params.require(:conversation).permit(:ai_model_id, :title)
  end
end
