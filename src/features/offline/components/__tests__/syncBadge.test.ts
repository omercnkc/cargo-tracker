import { SyncBadge } from '../SyncBadge';

declare const jest: any;
declare const describe: any;
declare const it: any;
declare const expect: any;

jest.mock('react-native', () => ({
  View: (props: any) => props,
  Text: (props: any) => props,
  StyleSheet: { create: (styles: any) => styles },
}));

describe('SyncBadge Unit Tests', () => {
  it('should render null for synced status', () => {
    const element = SyncBadge({ status: 'synced' });
    expect(element).toBeNull();
  });

  it('should render correct badge element for pending status', () => {
    const element = SyncBadge({ status: 'pending' });
    expect(element).not.toBeNull();
  });

  it('should render correct badge element for conflict status', () => {
    const element = SyncBadge({ status: 'conflict' });
    expect(element).not.toBeNull();
  });

  it('should render correct badge element for dead status', () => {
    const element = SyncBadge({ status: 'dead' });
    expect(element).not.toBeNull();
  });
});
