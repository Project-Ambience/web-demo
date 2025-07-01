Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # In development, allow requests from the React dev server
    origins "http://localhost:5090"

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ]
  end
end
