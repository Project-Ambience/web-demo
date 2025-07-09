class ResponseWorker
  include Sneakers::Worker

  from_queue "inference_results",
             durable: true,
             ack: true,
             retry_max_times: 5,
             timeout_job_after: 10

  def work(raw_message)
    message = JSON.parse(raw_message, symbolize_names: true)
    conversation_id = message[:request_id]
    result = message[:result]
    conversation = Conversation.find(conversation_id)
    message = Message.create!(conversation: conversation, role: "assistant", content: result)
    ack!
  rescue => e
    reject!
  end
end
