import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, ValidationOptions } from 'class-validator';

@ValidatorConstraint({ name: 'MatchPasswords', async: false })
export class MatchPasswords implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `${args.property} must match ${relatedPropertyName}`;
  }
}
