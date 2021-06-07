type service_metadata = bytes;
type service = address;
type service_owner = address;

type allowed_tokens = [@layout:comb] {
    tez: bool,
    assets: set(address)
}

type service_parameters = [@layout:comb] {
    metadata: service_metadata,
    allowed_tokens: allowed_tokens
}
