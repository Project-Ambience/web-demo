class Api::ConversationsController < Api::ApplicationController
  before_action :set_conversation, only: [ :show, :update, :destroy, :accept_feedback, :reject_feedback ]

  def index
    @conversations = Conversation.includes(:ai_model).order(updated_at: :desc)

    response_data = @conversations.map do |convo|
      {
        id: convo.id,
        title: convo.title,
        status: convo.status,
        updated_at: convo.updated_at,
        ai_model: {
          name: convo.ai_model.name,
          base_model: convo.ai_model.base_model,
          base_model_name: convo.ai_model.base_model&.name,
          speciality: convo.ai_model.speciality
        },
        base_prompt: convo.base_prompt,
        first_response: convo.first_response,
        file_url: convo.file_url,
        file_name: convo.file_name,
        few_shot_template: convo.few_shot_template,
        cot: convo.cot
      }
    end
    render json: response_data
  end

  def conversation_by_ai_model
    @conversations = Conversation.where(ai_model_id: params[:ai_model_id])

    response_data = @conversations.map do |convo|
      {
        id: convo.id,
        title: convo.title,
        status: convo.status,
        updated_at: convo.updated_at,
        ai_model: {
          name: convo.ai_model.name,
          base_model: convo.ai_model.base_model,
          base_model_name: convo.ai_model.base_model&.name,
          speciality: convo.ai_model.speciality
        },
        base_prompt: convo.base_prompt,
        first_response: convo.first_response,
        file_url: convo.file_url,
        file_name: convo.file_name,
        few_shot_template: convo.few_shot_template,
        cot: convo.cot
      }
    end
    render json: response_data
  end

  def show
    render json: @conversation.as_json(
      include: :messages,
      methods: [ :file_url, :file_name ]
    )
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

  def accept_feedback
    if @conversation.awaiting_feedback?
      @conversation.completed!
      render json: @conversation
    else
      render json: { error: "Conversation not awaiting feedback" }, status: :unprocessable_entity
    end
  end

  def reject_feedback
    if @conversation.awaiting_feedback?
      @conversation.awaiting_rejection_comment!
      render json: @conversation
    else
      render json: { error: "Conversation not awaiting feedback" }, status: :unprocessable_entity
    end
  end

  private

  def set_conversation
    @conversation = Conversation.find(params[:id])
  end

  def conversation_params
    params.require(:conversation).permit(:ai_model_id, :title)
  end
end
