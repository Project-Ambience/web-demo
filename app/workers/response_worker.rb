class ResponseWorker
  include Sneakers::Worker

  from_queue "inference_results",
             durable: true,
             ack: true,
             retry_max_times: 5,
             timeout_job_after: 10

  def work(raw_message)
    payload = JSON.parse(raw_message, symbolize_names: true)
    conversation_id = payload[:conversation_id]
    result = payload[:result]
    result_base_model = payload[:result_base_model]
    conversation = Conversation.find(conversation_id)
    message = Message.create!(conversation: conversation, role: "assistant", content: result)

    ActionCable.server.broadcast(
      "conversation_#{message.conversation_id}",
      { message: { id: message.id, role: message.role, content: message.content }, status: conversation.status }
    )

    if result_base_model.present?
      Message.create!(conversation: conversation, role: "assistant-base-model", content: result_base_model)
    end

    ack!
  rescue => e
    reject!
  end
end
