import { instanceToInstance, Transform } from 'class-transformer';
import { IsString, IsOptional, validate } from 'class-validator';
import { RequiredType } from '../lib';
import { getValidationMetadataByTarget } from './type-helpers.test-utils';

describe('RequiredType', () => {
  class BaseUserDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value + '_transformed')
    parentProperty?: string;
  }

  class CreateUserDto extends BaseUserDto {
    login: string = 'defaultLogin';

    @Transform(({ value }) => value + '_transformed')
    @IsString()
    @IsOptional()
    password?: string;
  }

  class UpdateUserDto extends RequiredType(CreateUserDto) {}

  describe('Validation metadata', () => {
    it('should inherit metadata', () => {
      const validationKeys = getValidationMetadataByTarget(UpdateUserDto).map(
        (item) => item.propertyName,
      );
      expect(validationKeys).toEqual(['password', 'parentProperty']);
    });
    describe('when object does not fulfil validation rules', () => {
      it('"validate" should ignore validation', async () => {
        const createDto = new CreateUserDto();

        const validationErrors = await validate(createDto);

        expect(validationErrors.length).toEqual(0);
      });

      it('"validate" should return validation errors', async () => {
        const updateDto = new UpdateUserDto();

        const validationErrors = await validate(updateDto);

        expect(validationErrors.length).toEqual(2);
        expect(validationErrors[0].constraints).toEqual({
          isString: 'password must be a string',
        });
        expect(validationErrors[1].constraints).toEqual({
          isString: 'parentProperty must be a string',
        });
      });
    });
    describe('otherwise', () => {
      it('"validate" should return an empty array', async () => {
        const updateDto = new UpdateUserDto();
        updateDto.password = '1234567891011';
        updateDto.parentProperty = 'test';

        const validationErrors = await validate(updateDto);
        expect(validationErrors.length).toEqual(0);
      });
    });
  });

  describe('Transformer metadata', () => {
    it('should inherit transformer metadata', () => {
      const password = '1234567891011';
      const parentProperty = 'test';

      const updateDto = new UpdateUserDto();
      updateDto.password = password;
      updateDto.parentProperty = parentProperty;

      const transformedDto = instanceToInstance(updateDto);
      expect(transformedDto.password).toEqual(password + '_transformed');
      expect(transformedDto.parentProperty).toEqual(
        parentProperty + '_transformed',
      );
    });
  });

  describe('Property initializers', () => {
    it('should inherit property initializers', () => {
      const updateUserDto = new UpdateUserDto();
      expect(updateUserDto.login).toEqual('defaultLogin');
    });
  });
});
