import { Type } from '@nestjs/common';
import { MappedType } from './mapped-type.interface';
import {
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from './type-helpers.utils';
import { RemoveFieldsWithType } from './types/remove-fields-with-type.type';

export function RequiredType<T>(classRef: Type<T>) {
  let isInheritedPredicate: (validationName: string | undefined) => boolean;
  try {
    const classValidator: typeof import('class-validator') = require('class-validator');
    isInheritedPredicate = (validationName: string | undefined) =>
      !validationName || validationName !== classValidator.IS_OPTIONAL;
  } catch {
    isInheritedPredicate = () => true;
  }

  abstract class RequiredClassType {
    constructor() {
      inheritPropertyInitializers(this, classRef);
    }
  }

  inheritValidationMetadata(
    classRef,
    RequiredClassType,
    undefined,
    isInheritedPredicate,
  );
  inheritTransformationMetadata(classRef, RequiredClassType);

  Object.defineProperty(RequiredClassType, 'name', {
    value: `Required${classRef.name}`,
  });

  return RequiredClassType as MappedType<
    RemoveFieldsWithType<Required<T>, Function>
  >;
}
