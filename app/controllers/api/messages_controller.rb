class Api::MessagesController < Api::ApplicationController
  def create
    @conversation = Conversation.find(params[:conversation_id])

    unless @conversation.awaiting_prompt? || @conversation.awaiting_rejection_comment?
      return render json: { error: "This conversation is not accepting new messages." }, status: :unprocessable_entity
    end

    @message = @conversation.messages.create(content: params[:message][:content], role: "user")

    if params[:message][:file].present?
      @message.file.attach(params[:message][:file])
    end

    if @message.persisted?
      input_history = @conversation.messages.map do |msg|
        { role: msg.role, content: msg.content }.tap do |hash|
          hash[:file_url] = msg.file_url if msg.file.attached?
        end
      end

      MessagePublisher.publish({
        conversation_id: @conversation.id,
        input: input_history,
        model_path: @conversation.ai_model.path
      }, ENV["USER_PROMPT_QUEUE_NAME"])

      @conversation.awaiting_feedback!
      render json: @message, status: :created
    else
      render json: @message.errors, status: :unprocessable_entity
    end
  end
end
