import React from 'react';

import { shallow } from 'enzyme';

import { mockOption } from 'services/__mocks__/pollOptions';

jest.mock('services/pollOptions', () => ({
  addPollOption: jest.fn((_id, _type, title) => {
    return new Promise((resolve) =>
      resolve({ data: mockOption('newOption', title) })
    );
  }),
  updatePollOption: jest.fn(() => {
    return new Promise((resolve) => resolve);
  }),
  deletePollOption: jest.fn(),
}));
import * as pollOptionsService from 'services/pollOptions';
const addPollOptionSpy = jest.spyOn(pollOptionsService, 'addPollOption');
const updatePollOptionSpy = jest.spyOn(pollOptionsService, 'updatePollOption');
const deletePollOptionSpy = jest.spyOn(pollOptionsService, 'deletePollOption');

// jest.mock('resources/GetTenantLocales');
// import { mockGetTenantLocales } from 'resources/__mocks__/GetTenantLocales';

jest.mock('resources/GetTenantLocales', ({ children }) =>
  children(['en', 'fr-BE'])
);

jest.mock('components/admin/FormLocaleSwitcher', () => 'FormLocaleSwitcher');
jest.mock('components/admin/ResourceList', () => ({
  TextCell: 'TextCell',
  Row: 'Row',
}));
jest.mock('components/UI/InputMultiloc', () => 'InputMultiloc');
jest.mock('components/UI/Button', () => 'Button');
jest.mock('utils/cl-intl', () => ({ FormattedMessage: 'FormattedMessage' }));

jest.mock('resources/GetTenant', () => 'GetTenant');

import FormOptionRow from './FormOptionRow';

let closeRow = jest.fn();
const getTitleMultiloc = (title: string) => ({ en: title });

describe('<FormOptionRow />', () => {
  beforeEach(() => {
    closeRow = jest.fn();
  });

  describe('boundaries', () => {
    it('reacts to option change', () => {
      const titleMultiloc = getTitleMultiloc('Vanilla');
      const wrapper = shallow(
        <FormOptionRow
          titleMultiloc={titleMultiloc}
          closeRow={closeRow}
          locale="en"
          mode="edit"
          questionId="questionId"
          optionId="optionId"
        />
      );
      wrapper.setProps({
        titleMultiloc: getTitleMultiloc('Pistachio'),
        optionId: 'anotherOption',
      });
      expect(wrapper.find('Input').prop('value')).toEqual('Pistachio');
    });
  });

  describe('handles language switch for multilingual content', () => {
    it('shows the passed in locale by default', () => {
      const wrapper = shallow(
        <FormOptionRow
          closeRow={closeRow}
          locale="en"
          mode="new"
          questionId="questionId"
        />
      );
      expect(wrapper.find('Input').prop('locale')).toBe('en');
      expect(wrapper.find('FormLocaleSwitcher').prop('selectedLocale')).toBe(
        'en'
      );
    });

    it('reacts to locale change', () => {
      const wrapper = shallow(
        <FormOptionRow
          closeRow={closeRow}
          locale="en"
          mode="new"
          questionId="questionId"
        />
      );
      wrapper.setProps({ locale: 'fr-BE' });
      expect(wrapper.find('Input').prop('locale')).toBe('fr-BE');
      expect(wrapper.find('FormLocaleSwitcher').prop('selectedLocale')).toBe(
        'fr-BE'
      );
    });

    it('handles changing field locale', () => {
      const wrapper = shallow(
        <FormOptionRow
          titleMultiloc={getTitleMultiloc('Vanilla')}
          closeRow={closeRow}
          locale="en"
          mode="new"
          questionId="questionId"
        />
      );
      wrapper.find('FormLocaleSwitcher').prop('onLocaleChange')('fr-BE');
      expect(wrapper.find('Input').prop('locale')).toBe('fr-BE');
    });
  });

  describe('handles input of title multiloc', () => {
    describe('for a new option', () => {
      it('passes down initial value', () => {
        const wrapper = shallow(
          <FormOptionRow
            closeRow={closeRow}
            locale="en"
            mode="new"
            questionId="questionId"
          />
        );
        expect(wrapper.find('Input').prop('value')).toEqual(undefined);
      });

      it('reacts to user input', () => {
        const titleMultiloc = getTitleMultiloc('Vanilla');
        const wrapper = shallow(
          <FormOptionRow
            titleMultiloc={titleMultiloc}
            closeRow={closeRow}
            locale="en"
            mode="new"
            questionId="questionId"
          />
        );
        wrapper.find('Input').prop('onChange')('Pistachio', 'en');
        wrapper.find('Input').prop('onChange')('Chocolate', 'fr-BE');
        const instance = wrapper.instance();
        expect(instance.state.titleMultiloc['en']).toBe('Pistachio');
        expect(instance.state.titleMultiloc['fr-BE']).toBe('Chocolate');
      });
    });

    describe('when editing an option', () => {
      it('passes down initial value', () => {
        const titleMultiloc = getTitleMultiloc('Vanilla');
        const wrapper = shallow(
          <FormOptionRow
            titleMultiloc={titleMultiloc}
            closeRow={closeRow}
            locale="en"
            mode="edit"
            questionId="questionId"
            optionId="optionId"
          />
        );
        expect(wrapper.find('Input').prop('value')).toEqual(
          titleMultiloc['en']
        );
      });

      it('reacts to user input', () => {
        const wrapper = shallow(
          <FormOptionRow
            titleMultiloc={getTitleMultiloc('Vani')}
            closeRow={closeRow}
            locale="en"
            mode="edit"
            questionId="questionId"
            optionId="optionId"
          />
        );
        wrapper.find('Input').prop('onChange')('Vanilla', 'en');
        expect(wrapper.find('Input').prop('value')).toEqual('Vanilla');
      });
    });
  });

  describe('handles saving', () => {
    describe('for a new option', () => {
      it('handles saving the new option', () => {
        const wrapper = shallow(
          <FormOptionRow
            titleMultiloc={getTitleMultiloc('Vani')}
            closeRow={closeRow}
            locale="en"
            mode="new"
            questionId="questionId"
          />
        );
        wrapper.find('.e2e-form-option-save').simulate('click');
        expect(addPollOptionSpy).toHaveBeenCalledTimes(1);
        expect(addPollOptionSpy).toHaveBeenCalledWith('questionId', {
          en: 'Vani',
        });
        // resolve the promise the test the callback
        return pollOptionsService.addPollOption().then(() => {
          expect(closeRow).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('when editing an option', () => {
      it('handles updating the option', () => {
        const wrapper = shallow(
          <FormOptionRow
            closeRow={closeRow}
            locale="en"
            mode="edit"
            questionId="questionId"
            optionId="optionId"
          />
        );
        wrapper.setState({ titleMultiloc: getTitleMultiloc('Vanilla') });
        wrapper.find('.e2e-form-option-save').simulate('click');
        expect(updatePollOptionSpy).toHaveBeenCalledTimes(1);
        expect(updatePollOptionSpy).toHaveBeenCalledWith('optionId', {
          en: 'Vanilla',
        });
      });
    });
  });

  describe('handles cancelling', () => {
    describe('for a new option', () => {
      it('handles closing the form to cancel', () => {
        const wrapper = shallow(
          <FormOptionRow
            closeRow={closeRow}
            locale="en"
            mode="new"
            questionId="questionId"
          />
        );
        wrapper.find('.e2e-form-option-cancel').simulate('click');
        expect(closeRow).toHaveBeenCalledTimes(1);
      });
    });

    describe('when editing an option', () => {
      it('handles closing the form to cancel', () => {
        const wrapper = shallow(
          <FormOptionRow
            titleMultiloc={getTitleMultiloc('Vani')}
            closeRow={closeRow}
            locale="en"
            mode="new"
            questionId="questionId"
            optionId="optionId"
          />
        );
        wrapper.find('.e2e-form-option-cancel').simulate('click');
        expect(closeRow).toHaveBeenCalledTimes(1);
      });
    });
  });
});
