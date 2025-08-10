class ResponseWorker
  include Sneakers::Worker

  from_queue "inference_results",
             durable: true,
             ack: true,
             retry_max_times: 5,
             timeout_job_after: 10

  def work(raw_message)
    message = JSON.parse(raw_message, symbolize_names: true)
    conversation_id = message[:conversation_id]
    result = message[:result]
    conversation = Conversation.find(conversation_id)
    message = Message.create!(conversation: conversation, role: "assistant", content: result)

    ActionCable.server.broadcast(
      "conversation_#{message.conversation_id}",
      { message: { id: message.id, role: message.role, content: message.content }, status: conversation.status }
    )

    ActionCable.server.broadcast(
      "inference_#{message.conversation.id}",
      { message: { id: message.id, role: message.role, content: message.content }, status: conversation.status }
    )

    if conversation.rag
      conversation.completed!
    end

    ack!
  rescue => e
    reject!
  end
end
