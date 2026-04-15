import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { logger } from '@/lib/logger';

export interface WidgetConfig {
  id: string;
  type: 'protein' | 'water';
  title: string;
  current: number;
  target: number;
  color: string;
}

class NativeWidgetService {
  private widgets: WidgetConfig[] = [];

  async addWidget(config: WidgetConfig): Promise<boolean> {
    try {
      // Save widget config to preferences
      this.widgets.push(config);
      await Preferences.set({
        key: 'native_widgets',
        value: JSON.stringify(this.widgets)
      });

      // On native platforms, this would trigger native widget creation
      if (Capacitor.isNativePlatform()) {
        return await this.createNativeWidget(config);
      } else {
        // For web, show a message about mobile functionality
        logger.log('Native widgets are only available on mobile devices');
        return true;
      }
    } catch (error) {
      console.error('Error adding widget:', error);
      return false;
    }
  }

  async removeWidget(widgetId: string): Promise<boolean> {
    try {
      this.widgets = this.widgets.filter(w => w.id !== widgetId);
      await Preferences.set({
        key: 'native_widgets',
        value: JSON.stringify(this.widgets)
      });

      if (Capacitor.isNativePlatform()) {
        return await this.removeNativeWidget(widgetId);
      }
      return true;
    } catch (error) {
      console.error('Error removing widget:', error);
      return false;
    }
  }

  async updateWidget(widgetId: string, data: Partial<WidgetConfig>): Promise<boolean> {
    try {
      const widgetIndex = this.widgets.findIndex(w => w.id === widgetId);
      if (widgetIndex === -1) return false;

      this.widgets[widgetIndex] = { ...this.widgets[widgetIndex], ...data };
      await Preferences.set({
        key: 'native_widgets',
        value: JSON.stringify(this.widgets)
      });

      if (Capacitor.isNativePlatform()) {
        return await this.updateNativeWidget(widgetId, data);
      }
      return true;
    } catch (error) {
      console.error('Error updating widget:', error);
      return false;
    }
  }

  async loadWidgets(): Promise<WidgetConfig[]> {
    try {
      const { value } = await Preferences.get({ key: 'native_widgets' });
      if (value) {
        this.widgets = JSON.parse(value);
      }
      return this.widgets;
    } catch (error) {
      console.error('Error loading widgets:', error);
      return [];
    }
  }

  private async createNativeWidget(config: WidgetConfig): Promise<boolean> {
    // This would be implemented with native code
    // For Android: Create AppWidgetProvider
    // For iOS: Create WidgetKit extension
    
    // Placeholder implementation
    logger.log('Creating native widget:', config);
    
    // In a real implementation, this would call native methods
    // Example: await NativeWidgets.create(config);
    
    return true;
  }

  private async removeNativeWidget(widgetId: string): Promise<boolean> {
    logger.log('Removing native widget:', widgetId);
    return true;
  }

  private async updateNativeWidget(widgetId: string, data: Partial<WidgetConfig>): Promise<boolean> {
    logger.log('Updating native widget:', widgetId, data);
    return true;
  }

  // Check if device supports widgets
  isWidgetSupported(): boolean {
    if (!Capacitor.isNativePlatform()) return false;
    
    // Android supports widgets on all versions
    if (Capacitor.getPlatform() === 'android') return true;
    
    // iOS supports widgets from iOS 14+
    if (Capacitor.getPlatform() === 'ios') {
      // In a real implementation, check iOS version
      return true;
    }
    
    return false;
  }
}

export const nativeWidgetService = new NativeWidgetService();