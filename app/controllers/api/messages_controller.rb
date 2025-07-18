class Api::MessagesController < Api::ApplicationController
  def create
    @conversation = Conversation.find(params[:conversation_id])

    unless @conversation.awaiting_prompt? || @conversation.awaiting_rejection_comment?
      return render json: { error: "This conversation is not accepting new messages." }, status: :unprocessable_entity
    end

    @message = @conversation.messages.create(content: params[:message][:content], role: "user")

    if params[:message][:file].present? && @conversation.awaiting_prompt?
      @message.file.attach(params[:message][:file])
    end

    if @message.persisted?
      input_history = @conversation.messages.map do |msg|
        { role: msg.role, content: msg.content }
      end

      payload = {
        conversation_id: @conversation.id,
        file_url: @message.file.attached? ? @message.file_url : nil
        input: input_history,
        base_model_path: @conversation.ai_model.path,
        adapter_path: @conversation.ai_model.adapter_path
      }

      MessagePublisher.publish(payload, ENV["USER_PROMPT_QUEUE_NAME"])

      @conversation.processing!
      render json: @message, status: :created
    else
      render json: @message.errors, status: :unprocessable_entity
    end
  end
end
