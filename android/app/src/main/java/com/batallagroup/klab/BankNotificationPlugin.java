package com.batallagroup.klab;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Set;

@CapacitorPlugin(name = "BankNotification")
public class BankNotificationPlugin extends Plugin {
    private static BankNotificationPlugin instance;

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    public static void onPaymentReceived(double amount, String bank, String title, String text) {
        if (instance != null) {
            JSObject ret = new JSObject();
            ret.put("amount", amount);
            ret.put("bank", bank);
            ret.put("title", title);
            ret.put("text", text);
            ret.put("timestamp", System.currentTimeMillis());
            instance.notifyListeners("bankPaymentDetected", ret, true);
        }
    }

    @PluginMethod
    public void isPermissionGranted(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context is null");
            return;
        }

        Set<String> packageNames = NotificationManagerCompat.getEnabledListenerPackages(context);
        boolean isGranted = packageNames.contains(context.getPackageName());

        JSObject ret = new JSObject();
        ret.put("granted", isGranted);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Error opening notification settings: " + e.getMessage());
        }
    }
}
