#include "../services-factory/types.religo"

let service_factory_function: service_factory_function = [%Michelson ({| {
    EMPTY_MAP key (pair key (option string)) ;
    PUSH bool True ;
    PAIR ;
    SENDER ;
    PUSH bytes 0x00 ;
    PAIR ;
    PAIR ;
    PUSH bool False ;
    PUSH bool False ;
    PAIR ;
    PUSH bool False ;
    EMPTY_SET address ;
    SWAP ;
    PAIR ;
    PUSH nat 0 ;
    PAIR ;
    PAIR ;
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
