class Api::MessagesController < Api::ApplicationController
  def create
    @conversation = Conversation.find(params[:conversation_id])

    unless @conversation.awaiting_prompt? || @conversation.awaiting_rejection_comment?
      return render json: { error: "This conversation is not accepting new messages." }, status: :unprocessable_entity
    end

    @message = @conversation.messages.new(content: params[:message][:content], role: "user")

    uploaded_file = params[:message][:file]
    if uploaded_file.present? && @conversation.file_url.blank?
      @message.file.attach(uploaded_file)
    end

    if @message.save
      if @message.file.attached? && @conversation.file_url.blank?
        @conversation.update(file_url: @message.file_url)
      end

      input_history = @conversation.reload.messages.map do |msg|
        { role: msg.role, content: msg.content }
      end

      MessagePublisher.publish({
        conversation_id: @conversation.id,
        file_url: @conversation.file_url,
        input: input_history,
        base_model_path: @conversation.ai_model.path,
        adapter_path: @conversation.ai_model.adapter_path
      }, ENV["USER_PROMPT_QUEUE_NAME"])

      @conversation.awaiting_feedback!
      render json: @message, status: :created
    else
      render json: @message.errors, status: :unprocessable_entity
    end
  end
end
