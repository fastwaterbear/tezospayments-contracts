export const commonErrors = {
  notImplemented: 'Not implemented',
  contractIsPaused: 'Contract is paused',
  noAllowedTokens: 'No allowed tokens',
  invalidAmount: 'Invalid amount',
  invalidAddress: 'Invalid address',
  invalidOperationType: 'Invalid operation type',
  invalidSigningKey: 'Invalid signing key',
} as const;

export const servicesFactoryErrors = {
  notAdministrator: 'Only administrator can do this',
  notFactoryImplementation: 'Only factory implementation can do this',
  invalidFactoryImplementation: 'Invalid factory implementation'
};

export const servicesFactoryImplementationErrors = {
  invalidFactory: 'Invalid factory',
  notFactory: 'Only factory contract can do this',
  factoryImplementationIsDisabled: 'Factory implementation is disabled',
  versionShouldBeDefined: 'Version should be defined',
  versionIsExcessParameter: 'Version is excess parameter',
};

export const serviceErrors = {
  serviceIsPaused: 'Service is paused',
  serviceIsDeleted: 'Service is deleted',
  notOwner: 'Only owner can do this',
  emptyUpdate: 'Empty update',
  privatePayloadNotSupported: 'Private payload is not supported at the moment',
} as const;
