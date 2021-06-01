#include "../services-factory/types.religo"

let service_factory_function: service_factory_function = [%Michelson ({| {
        DROP ;
        PUSH bool False ;
        SENDER ;
        PUSH bool False ;
        PAIR ;
        PAIR ;
        AMOUNT ;
        NONE key_hash ;

        CREATE_CONTRACT
#include "../../build/michelson/service.tz"
        ;
        PAIR
    } |}: service_factory_function)];

let main = (_: (service_factory_function, unit)): (list(operation), unit) => failwith("Should not be called")
