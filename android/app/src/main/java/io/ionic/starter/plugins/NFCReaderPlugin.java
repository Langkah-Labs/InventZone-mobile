package io.ionic.starter.plugins;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.nfc.FormatException;
import android.nfc.NfcAdapter;
import android.nfc.NfcManager;
import android.nfc.Tag;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import io.ionic.starter.WritableTag;

@CapacitorPlugin(name = "NFCReader")
public class NFCReaderPlugin extends Plugin {
    private String TAG = this.getClass().getName();

    private NfcAdapter adapter;

    @PluginMethod()
    public void initNFCAdapter(PluginCall call) {
        NfcManager nfcManager = (NfcManager) getActivity().getSystemService(Context.NFC_SERVICE);
        adapter = nfcManager.getDefaultAdapter();

        call.resolve();
    }

    private void enableNfcForegroundDispatch() {
        try {
            Intent intent = new Intent(getContext(), getActivity().getClass()).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent nfcPendingIntent = PendingIntent.getActivity(getContext(), 0, intent, PendingIntent.FLAG_MUTABLE);
            adapter.enableForegroundDispatch(getActivity(), nfcPendingIntent, null, null);
        } catch (IllegalStateException exception) {
            Log.e(TAG, "enableNfcForegroundDispatch: error enabling NFC foreground dispatch", exception);
        }
    }

    private void disableNfcForegroundDispatch() {
        try {
            adapter.disableForegroundDispatch(getActivity());
        } catch (IllegalStateException exception) {
            Log.e(TAG, "disableNfcForegroundDispatch: error disabling NFC foreground dispatch", exception);
        }
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        if (adapter != null) {
            enableNfcForegroundDispatch();
        }
    }

    @Override
    protected void handleOnPause() {
        if (adapter != null) {
            disableNfcForegroundDispatch();
        }

        super.handleOnPause();
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);

        Tag tagFromIntent = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
        if (tagFromIntent == null) {
            return;
        }

        try {
            WritableTag tag = new WritableTag(tagFromIntent);
            String tagId = tag.getTagId();
            JSObject ret = new JSObject();
            ret.put("tagId", tagId);

            notifyListeners("nfcRead", ret);
        } catch (FormatException exception) {
            Log.e(TAG, "handleOnNewIntent: unsupported tag tapped", exception);
        }
    }
}
