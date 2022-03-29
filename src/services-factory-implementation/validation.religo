#include "../common/validation.religo"
#include "./errors.religo"

[@inline] let fail_if_caller_is_not_factory = (storage: storage) => if (storage.factory != Tezos.sender) { failwith(errors_not_factory); };

[@inline] let fail_if_factory_implementation_is_disabled = (storage: storage) => if (storage.disabled) { failwith(errors_factory_implementation_is_disabled); };

[@inline] let fail_if_no_allowed_tokens = (service_parameters: service_parameters) => {
    if (!service_parameters.allowed_tokens.tez && Set.size(service_parameters.allowed_tokens.assets) == 0n) {
        failwith(errors_no_allowed_tokens);
    }
};

[@inline] let fail_if_service_parameters_are_invalid = (service_parameters: service_parameters) => {
    fail_if_no_allowed_tokens(service_parameters);
    Map.iter(((_, signing_key): (key, signing_key)) => fail_if_signing_key_is_invalid(signing_key), service_parameters.signing_keys);
};
