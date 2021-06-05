#include "../services-factory/types.religo"

let service_factory_function: service_factory_function = [%Michelson ({| {
    PUSH nat 0 ;
    SWAP ;
    DUP ;
    DUG 2 ;
    CDR ;
    CDR ;
    SIZE ;
    COMPARE ;
    EQ ;
    SWAP ;
    DUP ;
    DUG 2 ;
    CDR ;
    CAR ;
    NOT ;
    AND ;
    IF { PUSH string "No allowed tokens" ; FAILWITH } {} ;
    PUSH bool False ;
    SENDER ;
    DUP 3 ;
    CAR ;
    PAIR ;
    PUSH bool False ;
    DIG 3 ;
    CDR ;
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
